package cc.cafebabe.cardagainsthumanity.dao;

import java.util.Set;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

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
		/*
		long startTime = System.currentTimeMillis();
		
		Player p = PlayerService.logOrRegPlayer("admin", "1234", "0.0.0.0");
		if(p != null){
			p.setState(2);
			p.savePlayerData();
		}
		CardsService.addCardPack("����", 0);
		CardsService.addCardPack("�ۺ�", 5);
		CardsService.addCardPack("��", 5);
		CardsService.addCardPack("��Ϸ", 10);
		CardsService.addCardPack("Acfun", 20);
		CardsService.addCardPack("Bilibili", 20);
		CardsService.addCardPack("A��������", 30);
		CardsService.addCardPack("����", 100);
		
		
		for(int i = 0; i < 200; i++){
			CardsService.addBlackCard(1, "���Ժڿ�%b��" + i, (int)(Math.random() * 8) + 1);
			CardsService.addBlackCard(1, "����%b�ڿ�%b��" + i, (int)(Math.random() * 8) + 1);
			CardsService.addBlackCard(1, "%b����%b�ڿ�%b��" + i, (int)(Math.random() * 8) + 1);
		}
		
		for(int i = 0; i < 1000; i++){
			CardsService.addWhiteCard(1, "���԰׿�" + i, (int)(Math.random() * 8) + 1);
		}
		CardsService.approveAllCards();
		
		
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
		*/
		
		System.out.println("��������������");
		
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
				}
			}
		}).start();
	}
}
