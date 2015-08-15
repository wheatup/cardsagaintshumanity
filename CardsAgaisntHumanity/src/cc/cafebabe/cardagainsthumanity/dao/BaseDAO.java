package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class BaseDAO {
	public static Connection playersDB;
	public static Connection cardsDB;
	public static Connection sugDB;
	public static boolean resetMode = false;
	public static void init(){
		try {
			Class.forName("org.sqlite.JDBC");
			playersDB = DriverManager.getConnection("jdbc:sqlite://c:/CAH2Data/players.db");
			cardsDB = DriverManager.getConnection("jdbc:sqlite://c:/CAH2Data/cards.db");
			sugDB = DriverManager.getConnection("jdbc:sqlite://c:/CAH2Data/sug.db");
			BaseDAO.playersDB.setAutoCommit(false);
			BaseDAO.cardsDB.setAutoCommit(false);
			BaseDAO.sugDB.setAutoCommit(false);
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	public static void close(){
		synchronized (playersDB) {
			if(playersDB != null){
				try {
					playersDB.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
		
		synchronized (cardsDB) {
			if(cardsDB != null){
				try {
					cardsDB.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
		
		synchronized (sugDB) {
			if(sugDB != null){
				try {
					sugDB.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
	}
	
	public static void commit(){
		synchronized (playersDB) {
			if(playersDB != null){
				try {
					playersDB.commit();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
		
		synchronized (cardsDB) {
			if(cardsDB != null){
				try {
					cardsDB.commit();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
		
		synchronized (sugDB) {
			if(sugDB != null){
				try {
					sugDB.commit();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
		}
	}
}
