package cc.cafebabe.cardagainsthumanity.service;

public class PlayerService
{
	public static boolean isPlayerRegisted(String name){
		return false;
	}
	
	public static boolean registerPlayer(String name, String password){
		if(isPlayerRegisted(name)){
			return false;
		}
	}
}
