package cc.cafebabe.cardagainsthumanity.entities;

import java.util.Date;

public class Player
{
	private long pid;
	private String username;
	private String password;
	private Date regtime;
	private int state;
	private GameData gameData;
	
	public Player(long uid, String username, String password, Date regDate, int state, GameData gameData)
	{
		this.pid = uid;
		this.username = username;
		this.password = password;
		this.regtime = regDate;
		this.state = state;
		this.gameData = gameData;
	}
	
	public GameData getGameData()
	{
		return gameData;
	}
	public void setGameData(GameData gameData)
	{
		this.gameData = gameData;
	}
	public long getPid()
	{
		return pid;
	}
	public void setPid(long uid)
	{
		this.pid = uid;
	}
	public String getUsername()
	{
		return username;
	}
	public void setUsername(String username)
	{
		this.username = username;
	}
	public String getPassword()
	{
		return password;
	}
	public void setPassword(String password)
	{
		this.password = password;
	}
	public Date getRegtime()
	{
		return regtime;
	}
	public void setRegtime(Date regtime)
	{
		this.regtime = regtime;
	}
	public int getState()
	{
		return state;
	}
	public void setState(int state)
	{
		this.state = state;
	}
	
}
