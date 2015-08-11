package cc.cafebabe.cardagainsthumanity.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import cc.cafebabe.cardagainsthumanity.dao.CardsDAO;
import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Card;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.util.Misc;

public class CardsService
{
	public static Map<Integer, String> cardpacks;
	public static Map<Integer, Set<WhiteCard>> whitecards;
	public static Map<Integer, Set<BlackCard>> blackcards;
	
	public static void loadAllCards(){
		cardpacks = CardsDAO.getCardsPacks();
		loadBlackCards();
		loadWhiteCards();
	}
	
	private static void loadBlackCards(){
		blackcards = new HashMap<Integer, Set<BlackCard>>();
		for(Integer i : cardpacks.keySet()){
			Set<BlackCard> cards = CardsDAO.getBlackCards(i, Card.STATE_APPROVED);
			if(cards != null){
				blackcards.put(i, cards);
			}
		}
	}
	
	private static void loadWhiteCards(){
		whitecards = new HashMap<Integer, Set<WhiteCard>>();
		for(Integer i : cardpacks.keySet()){
			Set<WhiteCard> cards = CardsDAO.getWhiteCards(i, Card.STATE_APPROVED);
			if(cards != null)
				whitecards.put(i, cards);
		}
	}
	
	public static Set<WhiteCard> getWhiteCardsByPacks(int[] packids){
		Set<WhiteCard> cards = new HashSet<WhiteCard>();
		for(int i : packids){
			Set<WhiteCard> tempSet = whitecards.get(i);
			if(tempSet != null)
				cards.addAll(tempSet);
		}
		return cards;
	}
	
	public static Set<BlackCard> getBlackCardsByPacks(int[] packids){
		Set<BlackCard> cards = new HashSet<BlackCard>();
		for(int i : packids){
			Set<BlackCard> tempSet = blackcards.get(i);
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
				Set<WhiteCard> tempSet = whitecards.get(packid);
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
				Set<BlackCard> tempSet = blackcards.get(packid);
				if(tempSet != null)
				cards.addAll(tempSet);
			}
		}
		return cards;
	}
	
	public static boolean addWhiteCard(long pid, String text, String cardpack){
		if(text == null || text.length() > 200 || text.length() == 0){
			return false;
		}
		
		if(CardsDAO.isCardExist(text)){
			return false;
		}
		
		int packid = CardsDAO.getCardPackId(cardpack);
		
		if(packid == -1){
			return false;
		}
		
		CardsDAO.createCard(Card.TYPE_WHITE, packid, pid, text, Card.STATE_PENDING);
		
		return true;
	}
	
	public static boolean addBlackCard(long pid, String text, String cardpack){
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
		int packid = CardsDAO.getCardPackId(cardpack);
		
		if(packid == -1){
			return false;
		}
		CardsDAO.createCard(Card.TYPE_BLACK, packid, pid, text, Card.STATE_PENDING);
		
		return true;
	}
	
	public static void addCardPack(String packname, int level){
		int packid = CardsDAO.getCardPackId(packname);
		if(packid != -1){
			return;
		}
		
		CardsDAO.createCardPack(packname, level);
	}
	
	public static void approveAllCards(){
		CardsDAO.approveAllCards();
	}
}
