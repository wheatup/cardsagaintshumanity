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
}
