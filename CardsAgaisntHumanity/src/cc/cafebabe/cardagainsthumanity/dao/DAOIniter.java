package cc.cafebabe.cardagainsthumanity.dao;

public class DAOIniter
{
	public static void init()
	{
		BaseDAO.init();
		PlayerDAO.init();
		GameDataDAO.init();
		CardsDAO.init();
		new Thread(new Runnable() {
			public void run() {
				while(true){
					try {
						Thread.sleep(60000);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					BaseDAO.commit();
					System.out.println("Commit");
				}
			}
		}).start();
	}
}
