package cc.cafebabe.cardagainsthumanity.util;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

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
				for(Map<String, Object> m : hma.getMaps()){
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
		return BuildTextMessage(-1, msg);
	}
	
	public static Map<String, Object> BuildTextMessage(long id, String msg)
	{
		Map<String, Object> map = BuildMapByType(MessageType.TEXT);
		map.put("id", id);
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
		case ACTION:
			map.put("t", "act");
			break;
		case ACTIONEX:
			map.put("t", "actex");
			break;
		case JOIN_GAME:
			map.put("t", "join");
			break;
		case LEAVE_GAME:
			map.put("t", "leave");
			break;
		case GAMEINFO:
			map.put("t", "gameinfo");
			break;
		default:
			map.put("t", "d");
			break;
		}
		return map;
	}
}
