package cc.cafebabe.cardagainsthumanity.entities;

import java.util.Map;

public class GameData
{
	public GameData(long pid, int credit, int fish)
	{
		super();
		this.pid = pid;
		this.credit = credit;
		this.fish = fish;
	}
	private long pid;
	private int credit;
	private int fish;
	private Map<String, Object> data;
	@SuppressWarnings("unchecked")
	public <T> T getData(String key){
		
		T item = null;
		try{
			item = (T) data.get(key);
		}catch(Exception e){
			e.printStackTrace();
		}
		return item;
	}
	public long getPid()
	{
		return pid;
	}
	public void setPid(long pid)
	{
		this.pid = pid;
	}
	public int getCredit()
	{
		return credit;
	}
	public void setCredit(int credit)
	{
		this.credit = credit;
	}
	public int getFish()
	{
		return fish;
	}
	public void setFish(int fish)
	{
		this.fish = fish;
	}
	public Map<String, Object> getData()
	{
		return data;
	}
	public void setData(Map<String, Object> data)
	{
		this.data = data;
	}
	
	
}
