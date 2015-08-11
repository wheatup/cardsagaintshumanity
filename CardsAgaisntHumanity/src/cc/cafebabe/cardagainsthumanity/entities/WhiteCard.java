package cc.cafebabe.cardagainsthumanity.entities;

import java.sql.Date;

public class WhiteCard extends Card
{

	public WhiteCard(long cid, String text, int packid,
			String packname, long pid, String pname, int state, Date subdate)
	{
		super(cid, text, Card.TYPE_WHITE, packid, packname, pid, pname, state, subdate);
	}
	
}
