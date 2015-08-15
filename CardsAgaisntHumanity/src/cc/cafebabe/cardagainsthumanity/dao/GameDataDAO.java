package cc.cafebabe.cardagainsthumanity.dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Map;

import cc.cafebabe.cardagainsthumanity.entities.GameData;
import cc.cafebabe.cardagainsthumanity.util.Json2Map;

public class GameDataDAO
{
	public static void init(){
		try
		{
			//判断Player表是否存在
		    Statement stat = BaseDAO.playersDB.createStatement();
		    ResultSet rs = stat.executeQuery("select count(*) from sqlite_master where type='table' and name='gamedata';");
		    boolean exist = false;
		    if(rs.next()){
		    	exist = rs.getInt(1) > 0;
		    }
		    
		    //如果不存在则创建表
		    if(BaseDAO.resetMode || !exist){
		    	stat.executeUpdate("drop table if exists gamedata;");
			    stat.executeUpdate("create table gamedata (pid INTEGER PRIMARY KEY, credit INTEGER, fish INTEGER, exp INTEGER, ext NVARCHAR(500), FOREIGN KEY (pid) REFERENCES player(pid) ON DELETE CASCADE);");
			    stat.executeUpdate("CREATE INDEX idx_gdpid ON gamedata(pid);");
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
	
	/**
	 * 创建玩家游戏数据，并返回其实体对象
	 * @param pid
	 * @return
	 */
	public static GameData createGameData(long pid){
		synchronized(BaseDAO.playersDB){
		    PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("insert into gamedata values (?, ?, ?, ?, ?);");
				prep.setLong(1, pid);
			    prep.setInt(2, 0);
			    prep.setInt(3, 0);
			    prep.setInt(4, 0);
			    prep.setString(5, "");
			    prep.executeUpdate();
			    prep.close();
			    //BaseDAO.playersDB.commit();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
			return getGameData(pid);
		}
	}
	
	/**
	 * 通过pid获取游戏数据对象
	 * @param pid
	 * @return 游戏数据对象
	 */
	public static GameData getGameData(long pid){
		synchronized(BaseDAO.playersDB){
			GameData data = null;
		    PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("select credit, fish, exp, ext from gamedata where pid = ?;");
				prep.setLong(1, pid);
				ResultSet rs = prep.executeQuery();
				if(rs.next()){
					int credit = rs.getInt("credit");
					int fish = rs.getInt("fish");
					int exp = rs.getInt("exp");
					data = new GameData(pid, credit, fish, exp);
					String ext = rs.getString("ext");
					if(ext != null && ext.length() > 0){
						Map<String, Object> map = Json2Map.readFromJson(ext);
						if(map.size() > 0){
							data.setData(map);
						}
					}
				}
				rs.close();
				prep.close();
			}
			catch(SQLException e)
			{
				e.printStackTrace();
			}
		    return data;
		}
	}

	/**
	 * 保存游戏数据对象到数据库
	 * @param 游戏数据
	 */
	public static void saveGameData(GameData gameData){
		synchronized(BaseDAO.playersDB){
			PreparedStatement prep;
			try
			{
				prep = BaseDAO.playersDB.prepareStatement("update gamedata set credit = ?, fish = ?, exp = ?, ext = ? where pid = ?;");
			    prep.setInt(1, gameData.getCredit());
			    prep.setInt(2, gameData.getFish());
			    prep.setInt(3, gameData.getExp());
			    prep.setString(4, Json2Map.toJSONString(gameData.getData()));
			    prep.setLong(5, gameData.getPid());
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
