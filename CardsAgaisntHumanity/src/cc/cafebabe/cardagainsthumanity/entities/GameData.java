package cc.cafebabe.cardagainsthumanity.entities;

import java.util.HashMap;
import java.util.Map;

public class GameData
{
	public GameData(long pid, int credit, int fish, int exp)
	{
		super();
		this.pid = pid;
		this.credit = credit;
		this.fish = fish;
		this.exp = exp;
		this.datas = new HashMap<String, Object>();
	}
	private long pid;
	private int credit;
	private int fish;
	private int exp;
	private Map<String, Object> datas;
	@SuppressWarnings("unchecked")
	public <T> T getExtData(String key){
		
		T item = null;
		try{
			item = (T) datas.get(key);
		}catch(Exception e){
			e.printStackTrace();
		}
		return item;
	}
	public Map<String, Object> getDataMap(){
		return datas;
	}
	public void setExtData(String key, Object value){
		datas.put(key, value);
	}
	public void removeExtData(String key){
		datas.remove(key);
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
		return datas;
	}
	public void setData(Map<String, Object> data)
	{
		this.datas = data;
	}
	public int getExp() {
		return exp;
	}
	public void setExp(int exp) {
		this.exp = exp;
	}
	
}
