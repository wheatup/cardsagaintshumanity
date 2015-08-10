package cc.cafebabe.cardagainsthumanity.test;

import cc.cafebabe.cardagainsthumanity.dao.DAOIniter;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.service.GameDataService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class Main
{
	public static void main(String[] args)
	{
		DAOIniter.init();
		
		long startTime = System.currentTimeMillis();
		
		Player player1 = PlayerService.logOrRegPlayer("admin", "123456");
		player1.setState(1);
		player1.savePlayerData();
		player1.getGameData().setExtData("title", "π‹¿Ì‘±");
		player1.saveGameData();
		
		Player player2 = PlayerService.logOrRegPlayer("vital", "666");
		player2.setPassword("123456");
		player2.savePlayerData();
		
		System.out.println("spent time: " + (System.currentTimeMillis() - startTime));
	}
}
