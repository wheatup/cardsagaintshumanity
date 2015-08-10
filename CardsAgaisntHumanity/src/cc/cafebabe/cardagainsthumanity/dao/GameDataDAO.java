package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import cc.cafebabe.cardagainsthumanity.entities.GameData;
import cc.cafebabe.cardagainsthumanity.entities.Player;

public class GameDataDAO
{
	private static Connection conn;
	public static void init(){
		//判断PlayerData表是否存在
		try
		{
			Class.forName("org.sqlite.JDBC");
		
			conn = DriverManager.getConnection("jdbc:sqlite:players.db");
			
			//判断Player表是否存在
		    Statement stat = conn.createStatement();
		    ResultSet rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='gamedata';");
		    rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='gamedata';");
		    boolean exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    
		    //如果不存在则创建表
		    if(PlayerDAO.resetMode || !exist){
		    	stat.executeUpdate("drop table if exists gamedata;");
			    stat.executeUpdate("create table gamedata (pid INTEGER PRIMARY KEY, credit INTEGER, fish INTEGER, exp INTEGER, ext VARCHAR(500), FOREIGN KEY (pid) REFERENCE player(pid) ON DELETE CASCADE ON UPDATE CASCADE;");
		    }
		}
		catch(ClassNotFoundException e)
		{
			e.printStackTrace();
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	}
	
	public static GameData createGameData(long pid){
		GameData data = null;
	    PreparedStatement prep;
		try
		{
			prep = conn.prepareStatement("insert into gamedata values (?, ?, ?, ?, ?);");
			prep.setLong(1, pid);
		    prep.setInt(2, 0);
		    prep.setInt(3, 0);
		    prep.setInt(4, 0);
		    prep.setString(5, "");
		    prep.execute();
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	    return data;
	}
	
	public static GameData getGameData(long pid){
		GameData data = null;
	    PreparedStatement prep;
		try
		{
			prep = conn.prepareStatement("select * from gamedata where pid = ?;");
			prep.setLong(1, pid);
			ResultSet rs = prep.executeQuery();
			if(rs.next()){
				data = new GameData(pid);
			}
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	    return data;
	}
}
