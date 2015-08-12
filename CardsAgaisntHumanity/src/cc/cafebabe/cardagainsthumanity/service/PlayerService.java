package cc.cafebabe.cardagainsthumanity.service;

import cc.cafebabe.cardagainsthumanity.dao.PlayerDAO;
import cc.cafebabe.cardagainsthumanity.entities.Player;

public class PlayerService
{
	public static boolean isPlayerRegisted(String name){
		return PlayerDAO.getPidByName(name) != -1;
	}
	
	public static Player logOrRegPlayer(String name, String password){
		if(isPlayerRegisted(name)){
			Player player = PlayerDAO.getPlayer(name);
			if(player == null) return null;
			if(player.getPassword().equals(password)){
				System.out.println("��¼�û�:" + name);
				player.setFirstLogin(false);
				player.setLastMessageTime(System.currentTimeMillis());
				return player;
			}else{
				return null;
			}
		}else{
			System.out.println("ע���û�:" + name);
			Player player = PlayerDAO.createPlayer(name, password, 0);
			player.setFirstLogin(true);
			player.setLastMessageTime(System.currentTimeMillis());
			return player;
		}
	}
	
	public static Player getPlayerByPid(long pid){
		return PlayerDAO.getPlayer(pid);
	}
	
	public static Player getPlayerByName(String name){
		return PlayerDAO.getPlayer(name);
	}
	
	public static String getNameByPid(long pid){
		return PlayerDAO.getNameByPid(pid);
	}
	
	public static void savePlayer(Player player){
		if(player == null) return;
		PlayerDAO.savePlayer(player);
	}
	
	public static void updatePlayerLogTime(Player player){
		if(player == null) return;
		PlayerDAO.updateLogTime(player);
	}
	
	public static void deletePlayer(Player player){
		if(player == null) return;
		PlayerDAO.deletePlayer(player.getPid());
	}
}
