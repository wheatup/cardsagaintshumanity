package cc.cafebabe.cardagainsthumanity.entities;

import java.sql.Date;

public abstract class Card
{
	public static final int TYPE_BLACK = 0;
	public static final int TYPE_WHITE = 1;
	public static final int STATE_APPROVED = 0;
	public static final int STATE_PENDING = 1;
	public static final int STATE_DELETE = 2;
	public static final int STATE_HIDDEN = 3;
	
	public Card(long cid, String text, int typeid, int packid, String packname,
			long pid, String pname, int state, Date subdate)
	{
		super();
		this.cid = cid;
		this.text = text;
		this.typeid = typeid;
		this.packid = packid;
		this.packname = packname;
		this.pid = pid;
		this.pname = pname;
		this.state = state;
		this.subdate = subdate;
	}
	
	private long cid;
	private String text;
	private int typeid;
	private int packid;
	private String packname = "Î´Öª¿¨ÅÆ°ü";
	private long pid;
	private String pname = "admin";
	private int state;
	private Date subdate;
	public long getCid()
	{
		return cid;
	}
	public void setCid(long cid)
	{
		this.cid = cid;
	}
	public String getText()
	{
		return text;
	}
	public void setText(String text)
	{
		this.text = text;
	}
	public int getTypeid()
	{
		return typeid;
	}
	public void setTypeid(int typeid)
	{
		this.typeid = typeid;
	}
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
	public long getPid()
	{
		return pid;
	}
	public void setPid(long pid)
	{
		this.pid = pid;
	}
	public String getPname()
	{
		return pname;
	}
	public void setPname(String pname)
	{
		this.pname = pname;
	}
	public int getState()
	{
		return state;
	}
	public void setState(int state)
	{
		this.state = state;
	}
	public Date getSubdate()
	{
		return subdate;
	}
	public void setSubdate(Date subdate)
	{
		this.subdate = subdate;
	}
	public static int getTypeBlack()
	{
		return TYPE_BLACK;
	}
	public static int getTypeWhite()
	{
		return TYPE_WHITE;
	}
	public static int getStateApproved()
	{
		return STATE_APPROVED;
	}
	public static int getStatePending()
	{
		return STATE_PENDING;
	}
	public static int getStateDelete()
	{
		return STATE_DELETE;
	}
	public static int getStateHidden()
	{
		return STATE_HIDDEN;
	}
	
	public String toString(){
		return "¡¾" + (getTypeid() == Card.TYPE_BLACK ? "ºÚ¿¨" : "°×¿¨") + " : " +
				getText() + ", ×÷Õß: " + getPname() + ", ¿¨ÅÆ°ü: " + getPackname() + "¡¿";
	}
}
