package cc.cafebabe.cardagainsthumanity.dao;

import cc.cafebabe.cardagainsthumanity.consts.TaskType;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.util.Task;

public class DAOIniter
{
	public static void init()
	{
		BaseDAO.init();
		PlayerDAO.init();
		GameDataDAO.init();
		CardsDAO.init();
		SugDAO.init();
		initData();
	}
	
	private static void initData(){
		System.out.println("服务器已启动。");
		CardsService.loadAllCards();
		new Thread(new Runnable()
		{
			public void run()
			{
				while(true){
					try
					{
						Thread.sleep(60000);
					}
					catch(InterruptedException e)
					{
						e.printStackTrace();
					}
					BaseDAO.commit();
					String pack = "{\"t\":\"check\"}";
					Server.handler.addTask(new Task(null, TaskType.TIMER, pack));
				}
			}
		}).start();
	}
}
