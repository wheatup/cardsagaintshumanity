package cc.cafebabe.cardagainsthumanity.game;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public abstract class PlayerContainer {
	protected Map<Long, Player> players;
	public PlayerContainer(){
		players = Collections.synchronizedMap(new HashMap<Long, Player>());
	}
	
	public Map<Long, Player> getPlayers(){
		return players;
	}
	
	public void broadcastMessage(Map<String, Object> message){
		broadcastMessage(Json2Map.toJSONString(message));
	}
	
	public void broadcastMessageExceptSomeone(Map<String, Object> message, Player player){
		broadcastMessageExceptSomeone(Json2Map.toJSONString(message), player);
	}
	
	public void broadcastMessage(String message){
		for(Player p : players.values()){
			p.sendMessage(message);
		}
	}
	
	public void broadcastMessageExceptSomeone(String message, Player player){
		for(Player p : players.values()){
			if(p != player)
				p.sendMessage(message);
		}
	}
	
	public Player getPlayer(int pid){
		return players.get(pid);
	}
	
	public Player getPlayer(String name){
		Player player = null;
		for(Player p : players.values()){
			if(p.getName().equals(name)){
				player = p;
			}
		}
		return player;
	}
	
	public void addPlayer(Player player){
		players.put(player.getPid(), player);
	}
	
	public void removePlayer(Player player){
		players.remove(player.getPid());
	}
}
