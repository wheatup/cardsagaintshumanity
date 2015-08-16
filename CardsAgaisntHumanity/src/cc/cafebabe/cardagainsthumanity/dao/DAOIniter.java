package cc.cafebabe.cardagainsthumanity.dao;

import cc.cafebabe.cardagainsthumanity.service.CardsService;

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
		CardsService.addCardPack("»ù±¾", 0);
		CardsService.addCardPack("×ÛºÏ", 5);
		CardsService.addCardPack("¹£", 5);
		CardsService.addCardPack("ÓÎÏ·", 10);
		CardsService.addCardPack("Acfun", 20);
		CardsService.addCardPack("Bilibili", 20);
		CardsService.addCardPack("AµºÄäÃû°æ", 30);
		CardsService.addCardPack("×÷ËÀ", 100);
		
		
		for(int i = 0; i < 200; i++){
			CardsService.addBlackCard(1, "²âÊÔºÚ¿¨%b¡£" + i, (int)(Math.random() * 8) + 1);
			CardsService.addBlackCard(1, "²âÊÔ%bºÚ¿¨%b¡£" + i, (int)(Math.random() * 8) + 1);
			CardsService.addBlackCard(1, "%b²âÊÔ%bºÚ¿¨%b¡£" + i, (int)(Math.random() * 8) + 1);
		}
		
		for(int i = 0; i < 1000; i++){
			CardsService.addWhiteCard(1, "²âÊÔ°×¿¨" + i, (int)(Math.random() * 8) + 1);
		}
		CardsService.approveAllCards();
		
		
		Set<BlackCard> blackCards = CardsService.getBlackCardsByPacks(
				new String[]{"»ù±¾¿¨ÅÆ°ü", "»ù±¾¿¨ÅÆ°üEX"});
		Set<WhiteCard> whiteCards = CardsService.getWhiteCardsByPacks(
				new String[]{"»ù±¾¿¨ÅÆ°ü"});
		
		for(BlackCard card : blackCards){
			System.out.println(card);
		}
		for(WhiteCard card : whiteCards){
			System.out.println(card);
		}
		BaseDAO.commit();
		
		System.out.println("spent time: " + (System.currentTimeMillis() - startTime));
		*/
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
		}).start();;
	}
}
