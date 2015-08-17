package cc.cafebabe.cardagainsthumanity.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.service.CardsService;

public class Deck
{
	private List<BlackCard> blackCards;
	private List<WhiteCard> whiteCards;
	
	private Set<BlackCard> blackCardsPlayed;
	private Set<WhiteCard> whiteCardsPlayed;
	public Deck(int[] packids){
		Set<BlackCard> tempBlackCards = CardsService.getBlackCardsByPacks(packids);
		Set<WhiteCard> tempWhiteCards = CardsService.getWhiteCardsByPacks(packids);
		
		blackCards = new ArrayList<BlackCard>();
		whiteCards = new ArrayList<WhiteCard>();
		
		blackCards.addAll(tempBlackCards);
		whiteCards.addAll(tempWhiteCards);
		
		Collections.shuffle(blackCards);
		Collections.shuffle(whiteCards);
		
		blackCardsPlayed = new HashSet<BlackCard>();
		whiteCardsPlayed = new HashSet<WhiteCard>();
	}
	
	public BlackCard getBlackCard(){
		if(blackCards.isEmpty()){
			refillBlackCard();
		}
		BlackCard card = null;
		for(BlackCard c: blackCards){
			card = c;
			break;
		}
		
		blackCards.remove(card);
		blackCardsPlayed.add(card);
		
		return card;
	}
	
	public void refillBlackCard(){
		blackCards.addAll(blackCardsPlayed);
		blackCardsPlayed.clear();
		Collections.shuffle(blackCards);
	}
	
	
	public WhiteCard getWhiteCard(){
		if(whiteCards.isEmpty()){
			refillWhiteCard();
		}
		WhiteCard card = null;
		for(WhiteCard c: whiteCards){
			card = c;
			break;
		}
		
		whiteCards.remove(card);
		whiteCardsPlayed.add(card);
		
		return card;
	}
	
	public void refillWhiteCard(){
		whiteCards.addAll(whiteCardsPlayed);
		whiteCardsPlayed.clear();
		Collections.shuffle(whiteCards);
	}
}
