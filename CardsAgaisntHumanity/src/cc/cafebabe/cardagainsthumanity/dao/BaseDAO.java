package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class BaseDAO {
	public static Connection playersDB;
	public static Connection cardsDB;
	public static boolean resetMode = false;
	public static void init(){
		try {
			Class.forName("org.sqlite.JDBC");
			playersDB = DriverManager.getConnection("jdbc:sqlite:players.db");
			cardsDB = DriverManager.getConnection("jdbc:sqlite:cards.db");
			BaseDAO.playersDB.setAutoCommit(false);
			BaseDAO.cardsDB.setAutoCommit(false);
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	public static void close(){
		if(playersDB != null){
			try {
				playersDB.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		
		if(cardsDB != null){
			try {
				cardsDB.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
	
	public static void commit(){
		if(playersDB != null){
			try {
				playersDB.commit();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		if(cardsDB != null){
			try {
				cardsDB.commit();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
}
