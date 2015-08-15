package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Card;
import cc.cafebabe.cardagainsthumanity.entities.CardPack;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.service.CardsService;
import cc.cafebabe.cardagainsthumanity.service.PlayerService;

public class CardsDAO
{
	public static void init()
	{
		try
		{
			//判断CardPack表是否存在
		    Statement stat = BaseDAO.cardsDB.createStatement();
		    ResultSet rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='cardpack';");
		    boolean exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    rs.close();
		    stat.close();
		    //如果不存在则创建表
		    if(BaseDAO.resetMode || !exist){
		    	stat.executeUpdate("drop table if exists cardpack;");
			    stat.executeUpdate("create table cardpack (packid INTEGER PRIMARY KEY AUTOINCREMENT, name NVARCHAR(20) NOT NULL, needlevel INTEGER);");
			    //BaseDAO.cardsDB.commit();
		    }
			
			//判断Cards表是否存在
		    stat = BaseDAO.cardsDB.createStatement();
		    rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='card';");
		    exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    rs.close();
		    stat.close();
		    //如果不存在则创建表
		    if(BaseDAO.resetMode || !exist){
		    	stat.executeUpdate("drop table if exists card;");
			    stat.executeUpdate("create table card (cid INTEGER PRIMARY KEY AUTOINCREMENT, text NVARCHAR(200) NOT NULL, typeid INTEGER NOT NULL, packid INTEGER NOT NULL, pid INTEGER NOT NULL, state INTEGER NOT NULL, subdate DATETIME, pick INTEGER, rank INTEGER, FOREIGN KEY (packid) REFERENCES cardpack(packid) ON DELETE CASCADE);");
			    stat.executeUpdate("CREATE INDEX idx_cid ON card(cid);");
			    //BaseDAO.cardsDB.commit();
		    }
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	}
	
	public static void createCardPack(String name, int needLevel){
		synchronized(BaseDAO.cardsDB){
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement("insert into cardpack values (null, ?, ?);");
				prep.setString(1, name.trim());
			    prep.setInt(2, needLevel);
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
	
	public static String getCardPackName(int packid){
		synchronized(BaseDAO.cardsDB){
			String name = "Unknow";
			
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement("select name from cardpack where packid = ?;");
				prep.setInt(1, packid);
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
	
	public static void createCard(int typeid, int packid, long pid, String text, int state){
		synchronized(BaseDAO.cardsDB){
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement("insert into card values (null, ?, ?, ?, ?, ?, datetime('now'), 0, 0);");
				prep.setString(1, text);
			    prep.setInt(2, typeid);
			    prep.setInt(3, packid);
			    prep.setLong(4, pid);
			    prep.setInt(5, state);
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
	
	public static void setCardState(long cid, int state){
		synchronized(BaseDAO.cardsDB){
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"update card set state = ? where cid = ?;");
				prep.setInt(1, state);
			    prep.setLong(2, cid);
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
	
	
	public static void approveAllCards(){
		synchronized(BaseDAO.cardsDB){
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"update card set state = ? where state = ?;");
				prep.setInt(1, Card.STATE_APPROVED);
			    prep.setLong(2, Card.STATE_PENDING);
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
	
	public static Map<Integer, CardPack> getCardsPacks(){
		synchronized(BaseDAO.cardsDB){
			Map<Integer, CardPack> packs = new HashMap<Integer, CardPack>();
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement("select packid, name, needlevel from cardpack;");
			    ResultSet rs = prep.executeQuery();
			    while(rs.next()){
			    	int packid = rs.getInt("packid");
			    	String name = rs.getString("name");
			    	int level = rs.getInt("needlevel");
			    	CardPack cp = new CardPack(packid, name, level);
			    	cp.setWhiteCards(getWhiteCards(packid));
			    	cp.setBlackCards(getBlackCards(packid));
			    	packs.put(packid, cp);
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return packs;
		}
	}
	
	public static Card getCard(long cid){
		synchronized(BaseDAO.cardsDB){
			Card card = null;
			
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement("select * from card where cid = ?;");
				prep.setLong(1, cid);
			    ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	String text = rs.getString("text");
			    	int typeid = rs.getInt("typeid");
			    	int packid = rs.getInt("packid");
			    	String packname = getCardPackName(packid);
			    	long pid = rs.getLong("pid");
			    	String pname = PlayerDAO.getNameByPid(pid);
			    	int state = rs.getInt("state");
			    	Date subdate = rs.getDate("subdate");
			    	
			    	if(typeid == Card.TYPE_BLACK){
			    		card = new BlackCard(cid, text, packid, packname, pid, pname, state, subdate);
			    	}else if(typeid == Card.TYPE_WHITE){
			    		card = new WhiteCard(cid, text, packid, packname, pid, pname, state, subdate);
			    	}
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return card;
		}
	}
	
	public static Set<WhiteCard> getWhiteCards(int cardpack){
		synchronized(BaseDAO.cardsDB){
			Set<WhiteCard> cards = new HashSet<WhiteCard>();
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"select cid from card where typeid = ? and packid = ? and state = 0;");
				prep.setInt(1, Card.TYPE_WHITE);
				prep.setInt(2, cardpack);
			    ResultSet rs = prep.executeQuery();
			    while(rs.next()){
			    	long cid = rs.getLong("cid");
			    	Card card = getCard(cid);
			    	if(card != null){
			    		cards.add((WhiteCard) card);
			    	}
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return cards;
		}
	}
	
	public static Set<BlackCard> getBlackCards(int cardpack){
		synchronized(BaseDAO.cardsDB){
			Set<BlackCard> cards = new HashSet<BlackCard>();
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"select cid from card where typeid = ? and packid = ? and state = 0;");
				prep.setInt(1, Card.TYPE_BLACK);
				prep.setInt(2, cardpack);
			    ResultSet rs = prep.executeQuery();
			    while(rs.next()){
			    	long cid = rs.getLong("cid");
			    	Card card = getCard(cid);
			    	if(card != null){
			    		cards.add((BlackCard) card);
			    	}
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return cards;
		}
	}
	
	public static boolean isCardExist(String text){
		synchronized(BaseDAO.cardsDB){
			boolean exist = false;
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"select count(cid) cnt from card where text = ?;");
				prep.setString(1, text);
			    ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	exist = rs.getInt("cnt") > 0;
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return exist;
		}
	}
	
	public static int getCardPackId(String name){
		synchronized(BaseDAO.cardsDB){
			int packid = -1;
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"select packid from cardpack where name = ?;");
				prep.setString(1, name);
			    ResultSet rs = prep.executeQuery();
			    if(rs.next()){
			    	packid = rs.getInt("packid");
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return packid;
		}
	}
	
	public static Set<Card> getPendingCards(){
		synchronized(BaseDAO.cardsDB){
			Set<Card> cards = new HashSet<Card>();
			try
			{
				PreparedStatement prep = BaseDAO.cardsDB.prepareStatement(
						"select cid, text, typeid, packid, pid from card where state = '1';");
			    ResultSet rs = prep.executeQuery();
			    while(rs.next()){
			    	long cid = rs.getInt("cid");
			    	String text = rs.getString("text");
			    	int typeid = rs.getInt("typeid");
			    	int packid = rs.getInt("packid");
			    	int pid = rs.getInt("pid");
			    	Card card = null;
			    	if(typeid == 0){
			    		card = new BlackCard(cid, text, packid, CardsService.cardpacks.get(packid).getPackname(), pid, PlayerService.getNameByPid(pid), 1, null);
			    	}else{
			    		card = new WhiteCard(cid, text, packid, CardsService.cardpacks.get(packid).getPackname(), pid, PlayerService.getNameByPid(pid), 1, null);
			    	}
			    	cards.add(card);
			    }
			    rs.close();
			    prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return cards;
		}
	}
}
