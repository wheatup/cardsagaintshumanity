package cc.cafebabe.cardagainsthumanity.util;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class HashMapArray
{
	private List<Map<String,Object>> maps;
	public List<Map<String, Object>> getMaps()
	{
		return maps;
	}
	public void setMaps(List<Map<String, Object>> maps)
	{
		this.maps = maps;
	}
	
	public HashMapArray(){
		maps = new ArrayList<Map<String, Object>>();
	}
	
	public void addMap(Map<String, Object> map){
		maps.add(map);
	}
	
	public void removeMap(Map<String, Object> map){
		maps.remove(map);
	}
	
	public boolean containsMap(Map<String, Object> map){
		return maps.contains(map);
	}
}
