package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class BaseDAO {
	public static Connection playersDB;
	public static boolean resetMode = false;
	public static void init(){
		try {
			Class.forName("org.sqlite.JDBC");
			playersDB = DriverManager.getConnection("jdbc:sqlite:players.db");
			BaseDAO.playersDB.setAutoCommit(false);
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	public static void close(){
		if(playersDB != null)
			try {
				playersDB.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
	}
}
