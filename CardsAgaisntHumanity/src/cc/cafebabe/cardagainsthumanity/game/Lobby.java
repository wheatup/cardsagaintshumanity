package cc.cafebabe.cardagainsthumanity.game;

import java.util.HashMap;
import java.util.Map;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.util.HashMapArray;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class Lobby extends PlayerContainer{
	public static final int MAX_ROOM_COUNT = 20;
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
				Room r = new Room(i);
				rooms.put(i, r);
				Server.gameWorld.getLobby().broadcastMessage(Json2Map.buildAddNewRoomInfo(r));
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
		player.setRoomNumber(0);
		player.sendMessage(Json2Map.buildLobbyInfo(this));
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
	
	
	public HashMapArray buildRoomsInfo(){
		HashMapArray arr = new HashMapArray();
		for(int i = 1; i <= MAX_ROOM_COUNT; i++){
			Room room = rooms.get(i);
			if(room != null)
				arr.addMap(room.buildRoomShortInfo());
		}
		return arr;
	}
}
