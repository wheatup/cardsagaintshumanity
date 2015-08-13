package cc.cafebabe.cardagainsthumanity.entities;

import java.io.IOException;
import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

import javax.websocket.Session;

import cc.cafebabe.cardagainsthumanity.game.PlayerContainer;
import cc.cafebabe.cardagainsthumanity.service.GameDataService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class Player
{
	private long pid;
	private String name;
	private String password;
	private Date regtime;
	private int state;
	private GameData gameData;
	private Session session;
	private PlayerContainer container;
	public PlayerContainer getContainer()
	{
		return container;
	}
	public void setContainer(PlayerContainer container)
	{
		this.container = container;
	}

	private boolean isFirstLogin = false;
	private int roomNumber = -1;
	private long lastMessageTime = 0;
	public long getLastMessageTime()
	{
		return lastMessageTime;
	}

	public void setLastMessageTime(long lastMessageTime)
	{
		this.lastMessageTime = lastMessageTime;
	}

	public boolean isFirstLogin()
	{
		return isFirstLogin;
	}

	public void setFirstLogin(boolean isFirstLogin)
	{
		this.isFirstLogin = isFirstLogin;
	}

	public int getRoomNumber()
	{
		return roomNumber;
	}

	public void setRoomNumber(int roomNumber)
	{
		this.roomNumber = roomNumber;
	}

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
	
	public void sendMessage(Map<String, Object> map){
		if(session != null && session.isOpen()){
			try {
				session.getBasicRemote().sendText(Json2Map.toJSONString(map));
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
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
	
	public Map<String, Object> buildPlayerInfo(){
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("pid", this.getPid());
		map.put("name", this.getName());
		map.put("exp", this.getGameData().getExp());
		map.put("credit", this.getGameData().getCredit());
		map.put("fish", this.getGameData().getFish());
		map.put("state", this.getState());
		return map;
	}
}
