package cc.cafebabe.cardagainsthumanity.util;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.json.JsonString;
import javax.json.JsonValue;
import javax.json.JsonValue.ValueType;
import javax.json.JsonWriter;

import cc.cafebabe.cardagainsthumanity.entities.BlackCard;
import cc.cafebabe.cardagainsthumanity.entities.Player;
import cc.cafebabe.cardagainsthumanity.entities.WhiteCard;
import cc.cafebabe.cardagainsthumanity.game.GameWorld;
import cc.cafebabe.cardagainsthumanity.game.Lobby;
import cc.cafebabe.cardagainsthumanity.game.Room;
import cc.cafebabe.cardagainsthumanity.server.Server;
import cc.cafebabe.cardagainsthumanity.service.CardsService;

public class Json2Map
{
	public static String toJSONString(Map<String, Object> map)
	{
		if(map == null){
			return "";
		}
		
		JsonObjectBuilder job = Json.createObjectBuilder();
		for(String key : map.keySet())
		{
			if(map.get(key) instanceof HashMapArray){
				JsonArrayBuilder jab = Json.createArrayBuilder();
				JsonObjectBuilder job2 = Json.createObjectBuilder();
				HashMapArray hma = (HashMapArray) map.get(key);
				int len = hma.getMaps().size();
				for(int i = 0; i < len; i++){
					Map<String, Object> m = hma.getMaps().get(i);
					for(String k : m.keySet()){
						job2.add(k, m.get(k) == null ? "null" : m.get(k).toString());
					}
					jab.add(job2.build());
				}
				job.add(key, jab.build());
			}else{
				job.add(key, map.get(key) == null ? "null" : map.get(key).toString());
			}
		}
		JsonObject jo = job.build();
		StringWriter sw = new StringWriter();
		try(JsonWriter jw = Json.createWriter(sw))
		{
			jw.writeObject(jo);
		}
		return sw.toString();
	}
	
	public static Map<String, Object> readFromJson(String JsonString)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		try
		{
			JsonReader reader = Json.createReader(new StringReader(JsonString));
			JsonObject jo = reader.readObject();
			for(String s : jo.keySet())
			{
				JsonValue value = jo.get(s);
				if(value.getValueType() == ValueType.NULL)
				{
					map.put(s, null);
				}
				else if(value.getValueType() == ValueType.TRUE)
				{
					map.put(s, true);
				}
				else if(value.getValueType() == ValueType.FALSE)
				{
					map.put(s, false);
				}
				else if(value.getValueType() == ValueType.NUMBER)
				{
					if(((JsonNumber)value).isIntegral())
						map.put(s, ((JsonNumber)value).intValue());
					else
						map.put(s, ((JsonNumber)value).doubleValue());
				}
				else if(value.getValueType() == ValueType.STRING)
				{
					map.put(s, ((JsonString)value).getString());
				}
				else if(value.getValueType() == ValueType.ARRAY || value.getValueType() == ValueType.OBJECT)
				{
					map.put(s, readFromJson(value.toString()));
				}
				else
				{
					map.put(s, value.toString());
				}
			}
		}
		catch(Exception e)
		{
			
		}
		return map;
	}

	public static Map<String, Object> BuildFlagMessage(String k)
	{
		Map<String, Object> map = BuildMapByType(MessageType.FLAG);
		map.put("k", k);
		return map;
	}
	
	public static Map<String, Object> BuildKVMessage(String k, Object v)
	{
		Map<String, Object> map = BuildMapByType(MessageType.KV);
		map.put("k", k);
		map.put("v", v);
		return map;
	}
	
	public static Map<String, Object> BuildTextMessage(String msg)
	{
		return BuildTextMessage(0, msg);
	}
	
	public static Map<String, Object> BuildTextMessage(long pid, String msg)
	{
		Map<String, Object> map = BuildMapByType(MessageType.TEXT);
		map.put("pid", pid);
		map.put("text", msg);
		return map;
	}
	
	private static Map<String, Object> BuildMapByType(MessageType type)
	{
		Map<String, Object> map = new HashMap<String, Object>();
		switch(type)
		{
		case FLAG:
			map.put("t", "flag");
			break;
		case KV:
			map.put("t", "kv");
			break;
		case TEXT:
			map.put("t", "text");
			break;
		case ROOMINFO:
			map.put("t", "roominfo");
			break;
		case GAMEINFO:
			map.put("t", "gameinfo");
			break;
		case SERVERINFO:
			map.put("t", "serverinfo");
			break;
		case LOBBYINFO:
			map.put("t", "lobbyinfo");
			break;
		case MYINFO:
			map.put("t", "myinfo");
			break;
		case PLAYERLEAVE:
			map.put("t", "playerleave");
			break;
		case PLAYERENTER:
			map.put("t", "playerenter");
			break;
		case INFO:
			map.put("t", "info");
			break;
		case ADDNEWROOM:
			map.put("t", "addroom");
			break;
		case SWITCHPLACE:
			map.put("t", "onswitch");
			break;
		case CARDSENDED:
			map.put("t", "cardsended");
			break;
		case PEND:
			map.put("t", "pend");
			break;
		case BLACKCARD:
			map.put("t", "blackcard");
			break;
		case WHITECARD:
			map.put("t", "whitecard");
			break;
		default:
			map.put("t", "d");
			break;
		}
		return map;
	}
	
	public static Map<String, Object> BuildServerInfo(){
		Map<String, Object> map = BuildMapByType(MessageType.SERVERINFO);
		map.put("version", Server.version);
		map.put("players", Server.gameWorld.getPlayerCount());
		map.put("max", GameWorld.MAX_PLAYER);
		return map;
	}
	
	public static Map<String, Object> buildMyInfo(Player player){
		Map<String, Object> map = BuildMapByType(MessageType.MYINFO);
		HashMapArray arr = new HashMapArray();
		arr.addMap(player.buildPlayerInfo());
		map.put("info", arr);
		return map;
	}
	
	public static Map<String, Object> buildLobbyInfo(Lobby lobby){
		Map<String, Object> map = BuildMapByType(MessageType.LOBBYINFO);
		map.put("players", lobby.buildPlayersInfo());
		map.put("rooms", lobby.buildRoomsInfo());
		return map;
	}
	
	public static Map<String, Object> buildPlayerLeaveInfo(long pid){
		Map<String, Object> map = BuildMapByType(MessageType.PLAYERLEAVE);
		map.put("pid", pid);
		return map;
	}
	
	public static Map<String, Object> buildPlayerEnterInfo(Player player){
		Map<String, Object> map = BuildMapByType(MessageType.PLAYERENTER);
		HashMapArray hma = new HashMapArray();
		hma.addMap(player.buildPlayerInfo());
		map.put("player", hma);
		return map;
	}
	
	public static Map<String, Object> buildPlayerEnterInfo(Player player, boolean spectate){
		Map<String, Object> map = BuildMapByType(MessageType.PLAYERENTER);
		HashMapArray hma = new HashMapArray();
		hma.addMap(player.buildPlayerInfo());
		map.put("player", hma);
		map.put("spectate", spectate);
		return map;
	}
	
	public static Map<String, Object> buildRoomInfo(Room room){
		Map<String, Object> map = BuildMapByType(MessageType.ROOMINFO);
		map.put("players", room.buildPlayersInfo());
		map.put("spectators", room.buildSpectatorsInfo());
		map.put("id", room.getId());
		map.put("pw", room.getPassword());
		map.put("name", room.getName());
		map.put("state", room.getRound() == null ? 0 : room.getRound().getState());
		if(room.getCardpacks() != null){
			String cardpacks = "";
			for(int i : room.getCardpacks()){
				cardpacks+=CardsService.cardpacks.get(i).getPackid() + ",";
			}
			cardpacks = cardpacks.substring(0, cardpacks.length() - 1);
			map.put("cp", cardpacks);
		}
		return map;
	}
	
	public static Map<String, Object> buildCardPacksInfo(){
		Map<String, Object> map = BuildMapByType(MessageType.INFO);
		map.put("k", "cp");
		map.put("cp", CardsService.buildCardPacksInfo());
		return map;
	}
	
	public static Map<String, Object> buildAddNewRoomInfo(Room room){
		Map<String, Object> map = BuildMapByType(MessageType.ADDNEWROOM);
		HashMapArray hma = new HashMapArray();
		hma.addMap(room.buildRoomShortInfo());
		map.put("room", hma);
		return map;
	}
	
	public static Map<String, Object> buildPlayerSwitchInfo(long id, int place){
		Map<String, Object> map = BuildMapByType(MessageType.SWITCHPLACE);
		map.put("pid", id);
		map.put("place", place);
		return map;
	}
	
	public static Map<String, Object> buildCardSendedInfo(int total, int success, int repeat, int illegal){
		Map<String, Object> map = BuildMapByType(MessageType.CARDSENDED);
		map.put("to", total);
		map.put("su", success);
		map.put("re", repeat);
		map.put("il", illegal);
		return map;
	}
	
	public static Map<String, Object> buildPendingInfo(){
		Map<String, Object> map = BuildMapByType(MessageType.PEND);
		map.put("c", CardsService.buildAllPendingCardsInfo());
		return map;
	}
	
	public static Map<String, Object> buildBlackCardInfo(BlackCard card, int roundId, long czar){
		Map<String, Object> map = BuildMapByType(MessageType.BLACKCARD);
		map.put("text", card.getText());
		map.put("cp", card.getPackid());
		map.put("au", card.getPname());
		map.put("bl", card.getBlankCount());
		map.put("id", roundId);
		map.put("czar", czar);
		return map;
	}
	
	public static Map<String, Object> buildWhiteCardInfo(Set<WhiteCard> cards){
		Map<String, Object> map = BuildMapByType(MessageType.WHITECARD);
		HashMapArray hma = new HashMapArray();
		for(WhiteCard c : cards){
			Map<String, Object> m = new HashMap<String, Object>();
			m.put("text", c.getText());
			m.put("cp", c.getPackid());
			m.put("au", c.getPname());
			m.put("id", c.getCid());
			hma.addMap(m);
		}
		map.put("c", hma);
		return map;
	}
	
	public static Map<String, Object> buildJudgingInfo(int combo, Set<WhiteCard[]> cards){
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("t", "judge");
		int i = 0;
		for(WhiteCard[] wcs : cards){
			HashMapArray hma = new HashMapArray();
			for(WhiteCard wc : wcs){
				Map<String, Object> ccc = new HashMap<String, Object>();
				if(wc == null){
					ccc.put("text", "???");
					ccc.put("au", "???");
					ccc.put("cp", 0);
					ccc.put("id", 0);
				}else{
					ccc.put("text", wc.getText());
					ccc.put("au", wc.getPname());
					ccc.put("cp", wc.getPackid());
					ccc.put("id", wc.getCid());
				}
				hma.addMap(ccc);
			}
			map.put("c" + i, hma);
			i++;
		}
		map.put("bl", combo);
		return map;
	}
	
	public static Map<String, Object> buildWinnerInfo(String cidsraw, long pid, int combo, int add){
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("t", "winner");
		map.put("cid", cidsraw);
		map.put("pid", pid);
		map.put("combo", combo);
		map.put("add", add);
		return map;
	}
	
	public static Map<String, Object> buildWinnerBroadCast(String text){
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("t", "br");
		map.put("text", text);
		return map;
	}
}
