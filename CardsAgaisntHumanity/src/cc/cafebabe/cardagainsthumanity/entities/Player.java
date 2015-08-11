package cc.cafebabe.cardagainsthumanity.entities;

import java.io.IOException;
import java.sql.Date;

import javax.websocket.Session;

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
	private Session session;
	
	public Player(long uid, String name, String password, Date regDate, int state, GameData gameData)
	{
		this.pid = uid;
		this.name = name;
		this.password = password;
		this.regtime = regDate;
		this.state = state;
		this.gameData = gameData;
	}
	
	public Session getSession() {
		return session;
	}

	public void setSession(Session session) {
		this.session = session;
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
	
	public void sendMessage(String message){
		if(session != null && session.isOpen()){
			try {
				session.getBasicRemote().sendText(message);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	public void saveGameData(){
		GameDataService.saveGameData(this.gameData);
	}
	public void savePlayerData(){
		PlayerService.savePlayer(this);
	}
}
