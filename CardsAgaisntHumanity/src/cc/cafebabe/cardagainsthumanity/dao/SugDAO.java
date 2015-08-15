package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class SugDAO {
	public static void init(){
		try
		{
			//判断Sug表是否存在
		    Statement stat = BaseDAO.sugDB.createStatement();
		    ResultSet rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='sug';");
		    boolean exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    
		    //如果不存在则创建表
		    if(BaseDAO.resetMode || !exist){
		    	stat.executeUpdate("drop table if exists sug;");
			    stat.executeUpdate("create table sug (sid INTEGER PRIMARY KEY AUTOINCREMENT, pid INTEGER NOT NULL, text VARCHAR(200));");
			    //BaseDAO.playersDB.commit();
		    }
		    rs.close();
		    stat.close();
		}
		catch(SQLException e)
		{
			e.printStackTrace();
		}
	}
	
	public static void AddSug(long pid, String text){
		synchronized(BaseDAO.sugDB){
		    PreparedStatement prep;
			try
			{
				prep = BaseDAO.sugDB.prepareStatement("insert into sug values (null, ?, ?);");
				prep.setLong(1, pid);
			    prep.setString(2, text);
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
