package cc.cafebabe.cardagainsthumanity.entities;

import java.sql.Date;

import cc.cafebabe.cardagainsthumanity.util.Misc;

public class BlackCard extends Card
{
	public BlackCard(long cid, String text, int packid,
			String packname, long pid, String pname, int state, Date subdate)
	{
		super(cid, text, Card.TYPE_BLACK, packid, packname, pid, pname, state, subdate);
	}
	
	public static final String BLANK_SUP = "%b";
	public int getBlankCount()
	{
		return Misc.getSubstringCount(getText(), BLANK_SUP);
	}
}
