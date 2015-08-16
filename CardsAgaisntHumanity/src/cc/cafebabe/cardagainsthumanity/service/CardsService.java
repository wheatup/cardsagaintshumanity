package cc.cafebabe.cardagainsthumanity.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import cc.cafebabe.cardagainsthumanity.dao.CardsDAO;
import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Card;
import cc.cafebabe.cardagainsthumanity.entities.CardPack;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.util.HashMapArray;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;
import cc.cafebabe.cardagainsthumanity.util.Misc;

public class CardsService
{
	public static Map<Integer, CardPack> cardpacks;
	
	public static void loadAllCards(){
		cardpacks = CardsDAO.getCardsPacks();
		Server.gameWorld.broadcastMessage(Json2Map.buildCardPacksInfo());
	}
	
	public static Set<WhiteCard> getWhiteCardsByPacks(int[] packids){
		Set<WhiteCard> cards = new HashSet<WhiteCard>();
		for(int i : packids){
			Set<WhiteCard> tempSet = cardpacks.get(i).getWhiteCards();
			if(tempSet != null)
				cards.addAll(tempSet);
		}
		return cards;
	}
	
	public static Set<BlackCard> getBlackCardsByPacks(int[] packids){
		Set<BlackCard> cards = new HashSet<BlackCard>();
		for(int i : packids){
			Set<BlackCard> tempSet = cardpacks.get(i).getBlackCards();
			if(tempSet != null)
				cards.addAll(tempSet);
		}
		return cards;
	}
	
	public static Set<WhiteCard> getWhiteCardsByPacks(String[] packids){
		Set<WhiteCard> cards = new HashSet<WhiteCard>();
		for(String name : packids){
			int packid = CardsDAO.getCardPackId(name);
			if(packid != -1){
				Set<WhiteCard> tempSet = cardpacks.get(packid).getWhiteCards();
				if(tempSet != null)
				cards.addAll(tempSet);
			}
		}
		return cards;
	}
	
	public static Set<BlackCard> getBlackCardsByPacks(String[] packids){
		Set<BlackCard> cards = new HashSet<BlackCard>();
		for(String name : packids){
			int packid = CardsDAO.getCardPackId(name);
			if(packid != -1){
				Set<BlackCard> tempSet = cardpacks.get(packid).getBlackCards();
				if(tempSet != null)
				cards.addAll(tempSet);
			}
		}
		return cards;
	}
	
	public static boolean addWhiteCard(long pid, String text, String cardpack){
		int packid = CardsDAO.getCardPackId(cardpack);
		if(packid == -1){
			return false;
		}
		if(packid != -1)
			return addWhiteCard(pid, text, packid);
		return false;
	}
	
	public static boolean addWhiteCard(long pid, String text, int cardpack){
		if(text == null || text.length() > 200 || text.length() == 0){
			return false;
		}
		
		if(CardsDAO.isCardExist(text)){
			return false;
		}
		CardsDAO.createCard(Card.TYPE_WHITE, cardpack, pid, text, Card.STATE_PENDING);
		
		return true;
	}
	
	public static boolean addBlackCard(long pid, String text, String cardpack){
		int packid = CardsDAO.getCardPackId(cardpack);
		if(packid != -1)
			return addBlackCard(pid, text, packid);
		return false;
	}
	
	public static boolean addBlackCard(long pid, String text, int cardpack){
		if(text == null || text.length() > 200 || text.length() == 0){
			return false;
		}
		int blanks = Misc.getSubstringCount(text, BlackCard.BLANK_SUP);
		if(blanks < 1 || blanks > 3){
			return false;
		}
		if(CardsDAO.isCardExist(text)){
			return false;
		}
		CardsDAO.createCard(Card.TYPE_BLACK, cardpack, pid, text, Card.STATE_PENDING);
		return true;
	}
	
	public static void addCardPack(String packname, int level){
		CardsDAO.createCardPack(packname, level);
	}
	
	public static void delCardPack(String packname){
		CardsDAO.deleteCardPack(packname);
	}
	
	public static void approveAllCards(){
		CardsDAO.approveAllCards();
	}
	
	public static void approveCards(int[] cids){
		for(int i: cids){
			CardsDAO.setCardState(i, Card.STATE_APPROVED);
		}
	}
	
	public static void rejectCards(int[] cids){
		for(int i: cids){
			CardsDAO.deleteCard(i);
		}
	}
	
	public static HashMapArray buildCardPacksInfo(){
		HashMapArray hma = new HashMapArray();
		for(int i : cardpacks.keySet()){
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", cardpacks.get(i).getPackid());
			map.put("name", cardpacks.get(i).getPackname());
			map.put("lv", cardpacks.get(i).getNeedLevel());
			map.put("bc", cardpacks.get(i).getBlackCards().size());
			map.put("wc", cardpacks.get(i).getWhiteCards().size());
			hma.addMap(map);
		}
		
		return hma;
	}
	
	public static Set<Card> getAllPendingCards(){
		return CardsDAO.getPendingCards();
	}
	
	public static HashMapArray buildAllPendingCardsInfo(){
		System.out.println("ass");
		HashMapArray hma = new HashMapArray();
		Set<Card> cards = getAllPendingCards();
		if(cards != null)
		for(Card c : cards){
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", c.getCid());
			map.put("pl", c.getPname());
			map.put("pa", c.getPackname());
			map.put("ty", c.getTypeid());
			map.put("cp", c.getPackid());
			map.put("te", c.getText());
			hma.addMap(map);
		}
		return hma;
	}
}
