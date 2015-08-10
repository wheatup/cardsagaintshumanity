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
		for(int i = 0; i < 100000; i++){
			PlayerService.logOrRegPlayer("user" + i, "123456");
		}
		
		
//		
//		Player player1 = PlayerService.logOrRegPlayer("admin", "123456");
//		player1.setState(2);
//		player1.savePlayerData();
//		player1.getGameData().setExtData("title", "ºï×Ó");
//		player1.saveGameData();
//		
//		Player player2 = PlayerService.logOrRegPlayer("vital", "qq");
//		player2.setPassword("qq");
//		player2.savePlayerData();
		
		System.out.println("spent time: " + (System.currentTimeMillis() - startTime));
	}
}
