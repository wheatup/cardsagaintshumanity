package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;

import cc.cafebabe.cardagainsthumanity.entities.Player;

public class PlayerDAO
{
	private static Connection conn;
	public static boolean resetMode = false;
	
	public static void init()
	{
		try
		{
			Class.forName("org.sqlite.JDBC");
			conn = DriverManager.getConnection("jdbc:sqlite:players.db");
			
			//判断Player表是否存在
		    Statement stat = conn.createStatement();
		    ResultSet rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='player';");
		    boolean exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    
		    //如果不存在则创建表
		    if(resetMode || !exist){
		    	stat.executeUpdate("drop table if exists player;");
			    stat.executeUpdate("create table player (pid INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20) NOT NULL, password VARCHAR(20) NOT NULL, regtime DATETIME NOT NULL, state NUMBER(1) NOT NULL);");
		    }
//		    stat.executeUpdate("drop table if exists people;");
//		    stat.executeUpdate("create table people (name, occupation);");
//		    PreparedStatement prep = conn.prepareStatement(
//		      "insert into people values (?, ?);");
//
//		    prep.setString(1, "Gandhi");
//		    prep.setString(2, "politics");
//		    prep.addBatch();
//		    prep.setString(1, "Turing");
//		    prep.setString(2, "computers");
//		    prep.addBatch();
//		    prep.setString(1, "Wittgenstein");
//		    prep.setString(2, "smartypants");
//		    prep.addBatch();
//
//		    conn.setAutoCommit(false);
//		    prep.executeBatch();
//		    conn.setAutoCommit(true);
//
//		    ResultSet rs = stat.executeQuery("select * from people;");
//		    while (rs.next()) {
//		      System.out.println("name = " + rs.getString("name"));
//		      System.out.println("job = " + rs.getString("occupation"));
//		    }
//		    rs.close();
//		    conn.close();
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
	}
	
	public static Player createPlayer(String username, String password, int state){
		Player player = null;
	    PreparedStatement prep;
		try
		{
			prep = conn.prepareStatement("insert into player values (null, ?, ?, datetime('now'), ?);");
			prep.setString(1, username.trim());
		    prep.setString(2, password);
		    prep.setInt(3, state);
		    prep.execute();
		    
		    long pid = getPidByName(username);
		    if(pid != -1){
		    	
		    }
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	    return player;
	}
	
	public static long getPidByName(String username){
		long pid = -1;
		PreparedStatement prep;
		try
		{
			prep = conn.prepareStatement("select pid from player where name = ?;");
			prep.setString(1, username.trim());
			ResultSet rs = prep.executeQuery();
		    if(rs.next()){
		    	pid = rs.getLong("pid");
		    }
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
		return pid;
	}
	
	public static Player getPlayer(String username){
		Player player = null;
		PreparedStatement prep;
		try
		{
			prep = conn.prepareStatement("select * from player where name = ?;");
			prep.setString(1, username.trim());
		    ResultSet rs = prep.executeQuery();
		    if(rs.next()){
		    	long pid = rs.getLong("pid");
		    	String name = rs.getString("name");
		    	String password = rs.getString("password");
		    	Date regtime = rs.getDate("regtime");
		    	int state = rs.getInt("state");
		    	
		    	player = new Player(pid, name, password, regtime, state, gameData);
		    }
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	}
	
	public static void close(){
		if(conn != null){
			try
			{
				conn.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		}
	}
}
