package cc.cafebabe.cardagainsthumanity.game;

public class Room extends PlayerContainer{
	private Round round;
	private SpectateArea spectateArea;
	public Room(int id){
		spectateArea = new SpectateArea();
	}
}
