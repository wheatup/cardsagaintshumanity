package cc.cafebabe.cardagainsthumanity.entities;

import java.sql.Date;

import cc.cafebabe.cardagainsthumanity.service.GameDataService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class Player
{
	private long pid;
	private String name;
	private String password;
	private Date regtime;
	private int state;
	private GameData gameData;
	
	public Player(long uid, String name, String password, Date regDate, int state, GameData gameData)
	{
		this.pid = uid;
		this.name = name;
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
	public String getName()
	{
		return name;
	}
	public void setName(String name)
	{
		this.name = name;
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
	
	
	public void saveGameData(){
		GameDataService.saveGameData(this.gameData);
	}
	public void savePlayerData(){
		PlayerService.savePlayer(this);
	}
}
