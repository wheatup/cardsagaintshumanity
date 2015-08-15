package cc.cafebabe.cardagainsthumanity.entities;

import java.util.Set;

public class CardPack
{
	private int packid;
	private String packname;
	private int needLevel;
	private Set<BlackCard> blackCards;
	private Set<WhiteCard> whiteCards;
	
	public int getPackid()
	{
		return packid;
	}
	public void setPackid(int packid)
	{
		this.packid = packid;
	}
	public String getPackname()
	{
		return packname;
	}
	public void setPackname(String packname)
	{
		this.packname = packname;
	}
	public int getNeedLevel()
	{
		return needLevel;
	}
	public void setNeedLevel(int needLevel)
	{
		this.needLevel = needLevel;
	}
	
	public Set<BlackCard> getBlackCards()
	{
		return blackCards;
	}
	public void setBlackCards(Set<BlackCard> blackCards)
	{
		this.blackCards = blackCards;
	}
	public Set<WhiteCard> getWhiteCards()
	{
		return whiteCards;
	}
	public void setWhiteCards(Set<WhiteCard> whiteCards)
	{
		this.whiteCards = whiteCards;
	}
	public CardPack(int packid, String packname, int needLevel)
	{
		super();
		this.packid = packid;
		this.packname = packname;
		this.needLevel = needLevel;
	}
}
