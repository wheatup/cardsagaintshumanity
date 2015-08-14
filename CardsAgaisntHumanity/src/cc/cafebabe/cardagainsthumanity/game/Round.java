package cc.cafebabe.cardagainsthumanity.game;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;

public class Round extends PlayerContainer{
	public static final int STATE_IDLE = 0;
	public static final int STATE_PICKING = 1;
	public static final int STATE_JUDGING = 2;
	public static final int STATE_RANKING = 3;
	
	private int id;
	private BlackCard blackCard;
	private int state;
	
	public int getId(){return id;}
	public void setId(int id){this.id = id;}
	public BlackCard getBlackCard(){return blackCard;}
	public void setBlackCard(BlackCard blackCard){this.blackCard = blackCard;}
	public int getState(){return state;}
	public void setState(int state){this.state = state;}
	
	
	
}
