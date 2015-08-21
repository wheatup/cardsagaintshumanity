package cc.cafebabe.cardagainsthumanity.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import cc.cafebabe.cardagainsthumanity.consts.TaskType;
import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;
import cc.cafebabe.cardagainsthumanity.util.Task;

public class Round extends PlayerContainer{
	public static final int STATE_IDLE = 0;
	public static final int STATE_PICKING = 1;
	public static final int STATE_JUDGING = 2;
	public static final int STATE_RANKING = 3;
	
	private boolean running = false;
	private int id = 0;
	private BlackCard blackCard;
	private int state;
	private Deck deck;
	private Room room;
	private Map<Player, Set<WhiteCard>> handCards;
	private Map<Integer, Player> cardMap;
	private List<Player> orderedPlayer;
	private Set<WhiteCard[]> cardsCombo;
	private int czarIndex = 0;
	private int needCards = 0;
	private Player czar;
	
	public Player getCzar() {
		return czar;
	}
	public void setCzar(Player czar) {
		this.czar = czar;
	}
	public int getId(){return id;}
	public void setId(int id){this.id = id;}
	public BlackCard getBlackCard(){return blackCard;}
	public void setBlackCard(BlackCard blackCard){this.blackCard = blackCard;}
	public int getState(){return state;}
	public void setState(int state){this.state = state;}
	private int gameid;
	
	
	public Round(Room room, int[] packids, int gameid){
		this.room = room;
		handCards = new HashMap<Player, Set<WhiteCard>>();
		orderedPlayer = new ArrayList<Player>();
		cardsCombo = new HashSet<WhiteCard[]>();
		deck = new Deck(packids);
		id = 0;
		cardMap = new HashMap<Integer, Player>();
		this.gameid = gameid;
	}
	
	public void close(){
		this.running = false;
	}
	
	public void addOnePlayer(Player player){
		addPlayer(player);
		orderedPlayer.add(player);
		handCards.put(player, new HashSet<WhiteCard>());
	}
	
	public void removeOnePlayer(Player player){
		orderedPlayer.remove(player);
		removePlayer(player);
		handCards.remove(player);
		if(czar == player && (state == STATE_JUDGING || state == STATE_PICKING)){
			nextRound();
			return;
		}
		
		if(!cardMap.containsValue(player) && state == STATE_PICKING){
			needCards--;
			if(needCards == 1){
				judging();
			}
		}
	}
	
	public void start(){
		running = true;
		for(Player p : players.values()){
			p.afk = 0;
		}
		nextRound();
	}
	
	public void fillPlayerCards(){
		for(Player p : handCards.keySet()){
			Set<WhiteCard> cards = handCards.get(p);
			Set<WhiteCard> addedCards = new HashSet<WhiteCard>();
			for(int i = cards.size(); i < 10; i++){
				WhiteCard card = deck.getWhiteCard();
				cards.add(card);
				addedCards.add(card);
			}
			p.sendMessage(Json2Map.buildWhiteCardInfo(addedCards));
		}
	}
	
	public void nextRound(){
		id++;
		cardMap.clear();
		cardsCombo.clear();
		for(Player p : room.getPlayers().values()){
			if(!players.containsValue(p)){
				addOnePlayer(p);
			}
		}
		if(players.size() < 3){
			stop();
			return;
		}
		needCards = players.size();
		this.blackCard = deck.getBlackCard();
		picking();
	}
	
	public void picking(){
		state = STATE_PICKING;
		try{
			if(czarIndex >= orderedPlayer.size())
				czarIndex = 0;
			room.broadcastMessage(Json2Map.buildBlackCardInfo(blackCard, id, orderedPlayer.get(czarIndex).getPid()));
			czar = orderedPlayer.get(czarIndex);
			fillPlayerCards();
			
		}catch(Exception e){
			e.printStackTrace();
		}
		czarIndex++;
		setTimer(20000 + blackCard.getBlankCount() * 5000, "judge", this.room.getId(), id, gameid);
	}
	
	public void judging(){
		state = STATE_JUDGING;
		if(cardsCombo.size() > 0)
			room.broadcastMessage(Json2Map.buildJudgingInfo(blackCard.getBlankCount(), cardsCombo));
		else
			nextRound();
		setTimer(25000 + blackCard.getBlankCount() * 5000, "rank", this.room.getId(), id, gameid);
	}
	
	public void stop(){
		room.broadcastMessage(Json2Map.BuildFlagMessage("stop"));
		running = false;
		this.state = STATE_IDLE;
	}
	
	public void playerPick(Player player, int[] ids){
		WhiteCard[] cards = new WhiteCard[ids.length];
		
		Set<WhiteCard> handcards = handCards.get(player);
		Set<WhiteCard> removes = new HashSet<WhiteCard>();
		for(int i = 0; i < ids.length; i++){
			cards[i] = deck.getWhiteCardById(ids[i]);
			
			for(WhiteCard c : handcards){
				if(c.getCid() == ids[i])
					removes.add(c);
			}
		}
		
		for(WhiteCard c : removes){
			handcards.remove(c);
		}
		
		
		player.afk = 0;
		cardsCombo.add(cards);
		for(int id : ids){
			cardMap.put(id, player);
		}
		room.broadcastMessage(Json2Map.BuildKVMessage("picked", player.getPid()));
		needCards--;
		if(needCards == 1){
			judging();
		}
	}
	
	public void letwin(int[] cids, String cidsraw){
		setTimer(8000, "pick", this.room.getId(), id, gameid);
		
		state = STATE_RANKING;
		for(int in : cids){
			CardsService.pickCard(in);
		}
		if(czar != null){
			czar.afk = 0;
			czar.getGameData().setFish(czar.getGameData().getFish()+1);
			czar.getGameData().setExp(czar.getGameData().getExp()+1);
			czar.saveGameData();
			czar.sendMessage(Json2Map.buildMyInfo(czar));
		}
		
		Player p = cardMap.get(cids[0]);
		long pid = 0;
		int combo = 1;
		int add = 1;
		if(p != null){
			pid = p.getPid();
			for(Player allp: players.values()){
				if(allp != p && allp != czar){
					allp.getGameData().setCombo(0);
				}
			}
			if(cardsCombo.size() >= 3){
				p.getGameData().setCombo(p.getGameData().getCombo() + 1);
				combo = p.getGameData().getCombo();
				if(combo > 1)
					add = (cardsCombo.size() - 4) + (combo-1) * 3;
			}
			
			p.getGameData().setExp(p.getGameData().getExp() + add);
			p.saveGameData();
			p.sendMessage(Json2Map.buildMyInfo(p));
		}
		
		String blacktext = blackCard.getText();
		String[] whitecardtexts = new String[blackCard.getBlankCount()];
		try{
			for(int i = 0; i < whitecardtexts.length; i++){
				whitecardtexts[i] = "";
				WhiteCard c = deck.getWhiteCardById(cids[i]);
				blacktext = blacktext.replaceFirst("%b", "<span>" + c.getText() + "</span>");
			}
		}catch(Exception e){e.printStackTrace();}
		if(p != null){
			String ttt = room.getId() + "号房：" + blacktext + ",获胜者：" + p.getName();
			Server.gameWorld.broadcastMessage(Json2Map.buildWinnerBroadCast(ttt));
		}
		room.broadcastMessage(Json2Map.buildWinnerInfo(cidsraw, pid, combo, add));
	}
	
	
	public void rushToJudge(int r, int gid){
		if(!running) return;
		if(id != r || gameid != gid) return;
		if(state >= STATE_JUDGING) return;
		Set<Player> kickPlayers = new HashSet<Player>();
		for(Player p: players.values()){
			if(!cardMap.values().contains(p)){
				p.afk++;
				if(p.afk >= 3){
					kickPlayers.add(p);
				}
			}
		}
		
		for(Player p: kickPlayers){
			p.sendMessage(Json2Map.BuildKVMessage("kicked", "afk"));
			room.removePlayerFromRoom(p);
			Server.gameWorld.getLobby().sendPlayerInLobby(p);
		}		
		if(cardsCombo.size() == 0)
			nextRound();
		else
			judging();
	}
	
	public void rushToRank(int r, int gid){
		if(!running) return;
		if(this.id != r || this.gameid != gid) return;
		if(state >= STATE_RANKING) return;
		String name = "";
		if(czar!=null){
			czar.afk++;
			czar.getGameData().setFish(Math.max(czar.getGameData().getFish()-1, 0));
			czar.saveGameData();
			czar.sendMessage(Json2Map.buildMyInfo(czar));
			if(czar.afk >= 3){
				czar.sendMessage(Json2Map.BuildKVMessage("kicked", "afk"));
				room.removePlayerFromRoom(czar);
				Server.gameWorld.getLobby().sendPlayerInLobby(czar);
			}
			name = czar.getName();
		}
		System.out.println("rushtorank");
		room.broadcastMessage(Json2Map.BuildTextMessage(name + " 裁判时间已到，跳过裁判阶段，并扣除相应的裁判分。"));
		nextRound();
	}
	
	public void rushToPick(int r, int gid){
		if(!running) return;
		if(this.id != r || this.gameid != gid) return;
		nextRound();
	}
	
	public void setTimer(final int time, final String signal, final int roomNum, final int rnd, final int gid){
		new Thread(new Runnable()
		{
			
			@Override
			public void run()
			{
				try
				{
					Thread.sleep(time);
				}
				catch(InterruptedException e)
				{
					e.printStackTrace();
				}
				String pack = "{\"t\":\"" + signal + "\", \"room\":\"" + roomNum + "\", \"rnd\":\"" + rnd + "\", \"gid\":\"" + gid + "\"}";
				Server.handler.addTask(new Task(null, TaskType.TIMER, pack));
			}
		}).start();
	}
}
