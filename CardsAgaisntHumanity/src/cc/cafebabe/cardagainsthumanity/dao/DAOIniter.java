package cc.cafebabe.cardagainsthumanity.dao;

public class DAOIniter
{
	public static void init()
	{
		BaseDAO.init();
		PlayerDAO.init();
		GameDataDAO.init();
		CardsDAO.init();
	}
}
