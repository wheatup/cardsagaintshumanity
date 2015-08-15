package cc.cafebabe.cardagainsthumanity.service;

import cc.cafebabe.cardagainsthumanity.dao.SugDAO;

public class SugService {
	public static void AddSug(long pid, String sug){
		SugDAO.AddSug(pid, sug);
	}
}
