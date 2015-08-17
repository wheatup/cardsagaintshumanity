package cc.cafebabe.cardagainsthumanity.test;

public class Main
{
	public static void main(String[] args)
	{
		System.out.println(roll("wheatup", "123456"));
	}
	
	public static String roll(String name, String password){
		int len = name.length();
		name = name.toLowerCase();
		char[] chars = name.toCharArray();
		String re = "";
		int patternLen = (1 << (len + 1)) - 1;
		for(int i = 0; i < patternLen; i++){
			String pattern = Integer.toBinaryString(i);
			String result = "";
			for(int j = 0; j < len; j++){
				if(j < pattern.length() && pattern.charAt(j) == '1'){
					result += (char)(chars[j] - 32);
				}else{
					result += chars[j];
				}
			}
			re += "  " + result + ": '" +  password + "'\n";
		}
		return re;
	}
}
