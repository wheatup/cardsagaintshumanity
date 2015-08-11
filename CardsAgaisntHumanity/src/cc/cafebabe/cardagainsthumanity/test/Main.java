package cc.cafebabe.cardagainsthumanity.test;

import java.util.Set;

import cc.cafebabe.cardagainsthumanity.dao.BaseDAO;
import cc.cafebabe.cardagainsthumanity.dao.DAOIniter;
import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class Main
{
	public static void main(String[] args)
	{
		
		DAOIniter.init();
		long startTime = System.currentTimeMillis();
		
		PlayerService.logOrRegPlayer("admin", "123456");
		
		CardsService.addCardPack("基本卡牌包", 0);
		CardsService.addCardPack("基本卡牌包EX", 5);
		CardsService.addBlackCard(1, "测试黑卡%b1。", "基本卡牌包");
		CardsService.addBlackCard(1, "测试黑卡%b2。", "基本卡牌包");
		CardsService.addBlackCard(1, "测试黑卡%b3。", "基本卡牌包");
		CardsService.addBlackCard(1, "测试黑卡%b4。", "基本卡牌包EX");
		CardsService.addBlackCard(1, "测试黑卡%b5。", "基本卡牌包EX");
		CardsService.addWhiteCard(1, "测试白卡1", "基本卡牌包");
		CardsService.addWhiteCard(1, "测试白卡2", "基本卡牌包");
		CardsService.addWhiteCard(1, "测试白卡3", "基本卡牌包EX");
		CardsService.addWhiteCard(1, "测试白卡4", "基本卡牌包EX");
		CardsService.addWhiteCard(1, "测试白卡5", "基本卡牌包");
		
		CardsService.approveAllCards();
		
		CardsService.loadAllCards();
		
		Set<BlackCard> blackCards = CardsService.getBlackCardsByPacks(
				new String[]{"基本卡牌包", "基本卡牌包EX"});
		Set<WhiteCard> whiteCards = CardsService.getWhiteCardsByPacks(
				new String[]{"基本卡牌包"});
		
		for(BlackCard card : blackCards){
			System.out.println(card);
		}
		
		for(WhiteCard card : whiteCards){
			System.out.println(card);
		}
		
		BaseDAO.commit();
		System.out.println("spent time: " + (System.currentTimeMillis() - startTime));
	}
	
}
