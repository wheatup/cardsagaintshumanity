package cc.cafebabe.cardagainsthumanity.test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import cc.cafebabe.cardagainsthumanity.dao.BaseDAO;
import cc.cafebabe.cardagainsthumanity.dao.DAOIniter;
import cc.cafebabe.cardagainsthumanity.service.CardsService;

public class Main
{
	public static void main(String[] args) {
		DAOIniter.init();
//		CardsService.addCardPack("基本", 0);
//		CardsService.addCardPack("综合", 5);
//		CardsService.addCardPack("网络用语", 10);
//		CardsService.addCardPack("游戏综合", 20);
//		CardsService.addCardPack("Acfun", 30);
//		CardsService.addCardPack("Bilibili", 30);
//		CardsService.addCardPack("动漫", 50);
//		CardsService.addCardPack("A岛", 75);
//		CardsService.addCardPack("作死", 100);
		
		File f1 = new File("C:\\cah\\cah.txt");
		File f2 = new File("C:\\cah\\cah2.txt");
		try {
			FileReader fr = new FileReader(f1);
			BufferedReader br = new BufferedReader(fr);
			String s = null;
			while((s = br.readLine()) != null){
				System.out.println(s);
				CardsService.addBlackCard(1, s, 10);
			}
			
			fr = new FileReader(f2);
			br = new BufferedReader(fr);
			while((s = br.readLine()) != null){
				System.out.println(s);
				CardsService.addWhiteCard(1, s, 10);
			}
			CardsService.approveAllCards();
			BaseDAO.commit();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		
	}
}
