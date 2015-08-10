package cc.cafebabe.cardagainsthumanity.test;

import java.sql.SQLException;

import cc.cafebabe.cardagainsthumanity.dao.BaseDAO;
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
		for(int i = 0; i < 100; i++){
			PlayerService.logOrRegPlayer("user" + i, "123456");
		}
		System.out.println("spent time: " + (System.currentTimeMillis() - startTime));
	}
	
}
