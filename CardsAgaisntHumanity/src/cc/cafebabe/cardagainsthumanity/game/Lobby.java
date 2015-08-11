package cc.cafebabe.cardagainsthumanity.game;

import java.util.HashMap;
import java.util.Map;

import cc.cafebabe.cardagainsthumanity.entities.Player;

public class Lobby extends PlayerContainer{
	public static final int MAX_ROOM_COUNT = 100;
	
	private Map<Integer, Room> rooms;
	public Lobby(){
		rooms = new HashMap<Integer, Room>();
	}
	public Map<Integer, Room> getRooms() {
		return rooms;
	}
	
	public int createRoom(){
		for(int i = 1; i <= MAX_ROOM_COUNT; i++){
			if(!rooms.containsKey(i)){
				rooms.put(i, new Room(i));
				return i;
			}
		}
		return -1;
	}
	
	public void sendPlayerInLobby(Player player){
		addPlayer(player);
	}
}
