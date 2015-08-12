package cc.cafebabe.cardagainsthumanity.util;


public class Misc
{
	public static int getSubstringCount(String text, String sub)
	{
		int o = 0;
		int index=-1;
		while((index = text.indexOf(sub, index)) > -1){
			index++;
			o++;
		}
		return o;
	}
	
	public static int getStringLen(String text){
		int len = 0;
        if (text == null || text.length() == 0) return 0;
        len = text.length();
        for (int i = 0; i < text.length(); i++) {
        	char c = text.charAt(i);
            if (c > 255)
            	len++;
        }
        return len;
	}
}
