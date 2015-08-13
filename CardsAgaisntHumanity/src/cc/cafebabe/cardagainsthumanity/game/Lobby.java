package cc.cafebabe.cardagainsthumanity.game;

import java.util.HashMap;
import java.util.Map;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class Lobby extends PlayerContainer{
	public static final int MAX_ROOM_COUNT = 100;
	public boolean dirtyRoom = true;
	
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
	
	public Room getRoom(int id){
		return rooms.get(id);
	}
	
	public void sendPlayerInLobby(Player player){
		addPlayer(player);
		player.sendMessage(Json2Map.buildLobbyInfo(this));
		player.setRoomNumber(0);
		broadcastMessage(Json2Map.buildPlayerEnterInfo(player));
	}
	
	public void removePlayerFromLobby(Player player){
		removePlayer(player);
		broadcastMessage(Json2Map.buildPlayerLeaveInfo(player.getPid()));
	}
	
	public void destroyRoom(int id){
		rooms.remove(id);
		broadcastMessage(Json2Map.BuildKVMessage("destroyroom", id));
	}
}
