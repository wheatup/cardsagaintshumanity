package cc.cafebabe.cardagainsthumanity.service;

import cc.cafebabe.cardagainsthumanity.dao.GameDataDAO;
import cc.cafebabe.cardagainsthumanity.entities.GameData;
import cc.cafebabe.cardagainsthumanity.entities.Player;

public class GameDataService
{
	public static GameData getGameData(long pid){
		return GameDataDAO.getGameData(pid);
	}
	
	public static GameData getGameData(Player player){
		if(player == null) return null;
		return getGameData(player.getPid());
	}
	
	public static void saveGameData(GameData gameData){
		if(gameData == null) return;
		GameDataDAO.saveGameData(gameData);
	}
	
	public static GameData createGameData(long pid){
		return GameDataDAO.createGameData(pid);
	}
}
