package cc.cafebabe.cardagainsthumanity.dao;

public class ServerIniter
{
	public static void init()
	{
		PlayerDAO.init();
		GameDataDAO.init();
		CardsDAO.init();
	}
}
