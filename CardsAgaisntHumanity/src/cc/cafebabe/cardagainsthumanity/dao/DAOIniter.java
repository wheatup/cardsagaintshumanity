package cc.cafebabe.cardagainsthumanity.dao;

import java.util.Set;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class DAOIniter
{
	public static boolean isWriting = false;
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
		long startTime = System.currentTimeMillis();
		Player p = PlayerService.logOrRegPlayer("admin", "1234", "0.0.0.0");
		if(p != null){
			p.setState(2);
			p.savePlayerData();
		}
		CardsService.addCardPack("�������ư�", 0);
		CardsService.addCardPack("�������ư�EX", 5);
		CardsService.addBlackCard(1, "���Ժڿ�%b1��", "�������ư�");
		CardsService.addBlackCard(1, "���Ժڿ�%b2��", "�������ư�");
		CardsService.addBlackCard(1, "���Ժڿ�%b3��", "�������ư�");
		CardsService.addBlackCard(1, "���Ժڿ�%b4��", "�������ư�EX");
		CardsService.addBlackCard(1, "���Ժڿ�%b5��", "�������ư�EX");
		CardsService.addWhiteCard(1, "���԰׿�1", "�������ư�");
		CardsService.addWhiteCard(1, "���԰׿�2", "�������ư�");
		CardsService.addWhiteCard(1, "���԰׿�3", "�������ư�EX");
		CardsService.addWhiteCard(1, "���԰׿�4", "�������ư�EX");
		CardsService.addWhiteCard(1, "���԰׿�5", "�������ư�");
		CardsService.approveAllCards();
		CardsService.loadAllCards();
		Set<BlackCard> blackCards = CardsService.getBlackCardsByPacks(
				new String[]{"�������ư�", "�������ư�EX"});
		Set<WhiteCard> whiteCards = CardsService.getWhiteCardsByPacks(
				new String[]{"�������ư�"});
		
		for(BlackCard card : blackCards){
			System.out.println(card);
		}
		for(WhiteCard card : whiteCards){
			System.out.println(card);
		}
		BaseDAO.commit();
		System.out.println("spent time: " + (System.currentTimeMillis() - startTime));
		
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
					DAOIniter.isWriting = true;
					BaseDAO.commit();
					DAOIniter.isWriting = false;
				}
			}
		}).start();;
	}
}
