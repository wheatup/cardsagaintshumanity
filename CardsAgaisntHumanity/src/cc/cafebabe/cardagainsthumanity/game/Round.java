package cc.cafebabe.cardagainsthumanity.game;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class Round extends PlayerContainer{
	public static final int STATE_IDLE = 0;
	public static final int STATE_PICKING = 1;
	public static final int STATE_JUDGING = 2;
	public static final int STATE_RANKING = 3;
	
	private boolean running = false;
	private int id;
	private BlackCard blackCard;
	private int state;
	private Deck deck;
	private Room room;
	public int getId(){return id;}
	public void setId(int id){this.id = id;}
	public BlackCard getBlackCard(){return blackCard;}
	public void setBlackCard(BlackCard blackCard){this.blackCard = blackCard;}
	public int getState(){return state;}
	public void setState(int state){this.state = state;}
	
	
	public Round(Room room, int[] packids){
		this.room = room;
		deck = new Deck(packids);
		id = 0;
	}
	
	public void close(){
		this.running = false;
	}
	
	public void addOnePlayer(Player player){
		addPlayer(player);
	}
	
	public void removeOnePlayer(Player player){
		removePlayer(player);
	}
	
	public void start(){
		id++;
		running = true;
		for(Player p : room.getPlayers().values()){
			addOnePlayer(p);
		}
		this.blackCard = deck.getBlackCard();
		picking();
	}
	
	public void picking(){
		room.broadcastMessage(Json2Map.buildBlackCardInfo(blackCard));
	}
	
	public void rushToJudge(){
		
	}
	
	public void rushToRank(){
		
	}
	
	public void rushToPick(){
		
	}
}
