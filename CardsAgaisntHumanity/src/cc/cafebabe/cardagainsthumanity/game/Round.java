package cc.cafebabe.cardagainsthumanity.game;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class Round extends PlayerContainer{
	public static final int STATE_IDLE = 0;
	public static final int STATE_PICKING = 1;
	public static final int STATE_JUDGING = 2;
	public static final int STATE_RANKING = 3;
	
	private boolean running = false;
	private int id = 1;
	private BlackCard blackCard;
	private int state;
	private Deck deck;
	private Room room;
	private Map<Player, Set<WhiteCard>> handCards;
	private List<Player> orderedPlayer;
	private int czarIndex = 0;
	
	public int getId(){return id;}
	public void setId(int id){this.id = id;}
	public BlackCard getBlackCard(){return blackCard;}
	public void setBlackCard(BlackCard blackCard){this.blackCard = blackCard;}
	public int getState(){return state;}
	public void setState(int state){this.state = state;}
	
	
	public Round(Room room, int[] packids){
		this.room = room;
		handCards = new HashMap<Player, Set<WhiteCard>>();
		orderedPlayer = new ArrayList<Player>();
		deck = new Deck(packids);
		id = 1;
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
	}
	
	public void start(){
		state = STATE_PICKING;
		running = true;
		for(Player p : room.getPlayers().values()){
			addOnePlayer(p);
		}
		this.blackCard = deck.getBlackCard();
		picking();
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
		for(Player p : room.getPlayers().values()){
			if(!players.containsValue(p)){
				addOnePlayer(p);
			}
		}
		this.blackCard = deck.getBlackCard();
		picking();
	}
	
	public void picking(){
		state = STATE_PICKING;
		try{
			if(czarIndex >= orderedPlayer.size())
				czarIndex = 0;
			room.broadcastMessage(Json2Map.buildBlackCardInfo(blackCard, id, orderedPlayer.get(czarIndex).getPid()));
			fillPlayerCards();
			
		}catch(Exception e){
			e.printStackTrace();
		}
		czarIndex++;
	}
	
	public void rushToJudge(){
		
	}
	
	public void rushToRank(){
		
	}
	
	public void rushToPick(){
		
	}
}
