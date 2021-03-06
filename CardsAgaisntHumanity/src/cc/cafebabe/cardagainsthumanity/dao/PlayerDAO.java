package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import cc.cafebabe.cardagainsthumanity.entities.GameData;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.service.GameDataService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class PlayerDAO
{
	public static void init()
	{
		try
		{
			//判断Player表是否存在
		    Statement stat = BaseDAO.playersDB.createStatement();
		    ResultSet rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='player';");
		    boolean exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    rs.close();
		    stat.close();
		    //如果不存在则创建表
		    if(BaseDAO.resetMode || !exist){
		    	stat.executeUpdate("drop table if exists player;");
			    stat.executeUpdate("create table player (pid INTEGER PRIMARY KEY AUTOINCREMENT, name NVARCHAR(20) NOT NULL, password VARCHAR(20) NOT NULL, regtime DATETIME NOT NULL, state NUMBER(1) NOT NULL, logtime DATETIME, regip VARCHAR(16));");
			    stat.executeUpdate("CREATE INDEX idx_pid ON player(pid);");
			    //BaseDAO.playersDB.commit();
		    }
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	}
	
	public static Player createPlayer(String username, String password, String ip, int state){
		synchronized(BaseDAO.playersDB){
			Player player = null;
		    PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("insert into player values (null, ?, ?, datetime('now'), ?, datetime('now'), ?);");
				prep.setString(1, username.trim());
			    prep.setString(2, password);
			    prep.setInt(3, state);
			    prep.setString(4, ip);
			    prep.executeUpdate();
			    long pid = PlayerDAO.getPidByName(username);
			    GameDataService.createGameData(pid);
			    player = PlayerService.getPlayerByName(username);
			    prep.close();
			    //BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		    return player;
		}
	}
	
	public static long getPidByName(String username){
		synchronized(BaseDAO.playersDB){
			long pid = -1;
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("select pid from player where name = ?;");
				prep.setString(1, username.trim());
				ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	pid = rs.getLong("pid");
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return pid;
		}
	}
	
	public static String getNameByPid(long pid){
		synchronized(BaseDAO.playersDB){
			String name = "未知用户";
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("select name from player where pid = ?;");
				prep.setLong(1, pid);
				ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	name = rs.getString("name");
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return name;
		}
	}
	
	public static Player getPlayer(long pid){
		synchronized(BaseDAO.playersDB){
			Player player = null;
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("select name, password, regtime, state from player where pid = ?;");
				prep.setLong(1, pid);
			    ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	String name = rs.getString("name");
			    	String password = rs.getString("password");
			    	Date regtime = rs.getDate("regtime");
			    	int state = rs.getInt("state");
			    	GameData gameData = GameDataDAO.getGameData(pid);
			    	player = new Player(pid, name, password, regtime, state, gameData);
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return player;
		}
	}
	
	public static Player getPlayer(String username){
		synchronized(BaseDAO.playersDB){
			Player player = null;
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("select * from player where name = ?;");
				prep.setString(1, username.trim());
			    ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	long pid = rs.getLong("pid");
			    	String name = rs.getString("name");
			    	String password = rs.getString("password");
			    	Date regtime = rs.getDate("regtime");
			    	int state = rs.getInt("state");
			    	GameData gameData = GameDataDAO.getGameData(pid);
			    	player = new Player(pid, name, password, regtime, state, gameData);
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return player;
		}
	}
	
	public static void savePlayer(Player player){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement(
						"update player set name = ?, password = ?, state = ? where pid = ?;");
				prep.setString(1, player.getName());
			    prep.setString(2, player.getPassword());
			    prep.setInt(3, player.getState());
			    prep.setLong(4, player.getPid());
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
	
	public static void updateLogTime(Player player){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement(
						"update player set logtime = datetime('now') where pid = ?;");
			    prep.setLong(1, player.getPid());
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
	
	public static void deletePlayer(long pid){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("delete from player where pid = ?;");
			    prep.setLong(1, pid);
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
	
	public static int getRegPlayersCount(String ip){
		synchronized(BaseDAO.playersDB){
			int count = 0;
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("select count(pid) cnt from player where regip = ?;");
				prep.setString(1, ip);
			    ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	count = rs.getInt("cnt");
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return count;
		}
	}
	
	public static void banPlayer(String name){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("update player set state = '1' where name = ?;");
			    prep.setString(1, name);
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
	
	public static void unbanPlayer(String name){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("update player set state = '0' where name = ? and state = ?;");
			    prep.setString(1, name);
			    prep.setInt(2, 1);
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
	
	public static void opPlayer(String name){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("update player set state = '2' where name = ?;");
			    prep.setString(1, name);
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
	
	public static void deopPlayer(String name){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("update player set state = 2 where name = ? and state = '1';");
			    prep.setString(1, name);
				prep.executeUpdate();
				prep.close();
				//BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
}
