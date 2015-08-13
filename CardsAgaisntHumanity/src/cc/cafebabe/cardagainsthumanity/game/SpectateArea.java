package cc.cafebabe.cardagainsthumanity.game;

import cc.cafebabe.cardagainsthumanity.entities.Player;


public class SpectateArea extends PlayerContainer{
	private Room room;
	public SpectateArea(Room room){
		this.room = room;
	}
	public Room getRoom() {
		return room;
	}
	public void setRoom(Room room) {
		this.room = room;
	}



	public void sendPlayerInSpectator(Player player){
		addPlayer(player);
	}
	
	public void removePlayerFromSpectator(Player player){
		removePlayer(player);
	}
}
