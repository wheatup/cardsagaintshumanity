package cc.cafebabe.cardagainsthumanity.util;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;

public class TaskHandler implements Runnable {
	private boolean running = false;
	private Queue<Task> tasks;
	private static final int QUEUE_SIZE = 4096;
	
	public TaskHandler(){
		this.tasks = new ArrayBlockingQueue<Task>(QUEUE_SIZE);
	}

	@Override
	public void run() {
		this.running = true;
		while(running){
			while(!tasks.isEmpty()){
				handleTask(tasks.poll());
			}
			try {
				Thread.sleep(1);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
	public void shutdown(){
		running = false;
	}
	
	private void handleTask(Task task){
		switch(task.getTaskType()){
		case OPEN:
			try {
				task.getSession().getBasicRemote().sendText(Json2Map.toJSONString(Json2Map.BuildServerInfo()));
			} catch (IOException e) {
				e.printStackTrace();
			}
			break;
		case CLOSE:
			break;
		case MESSAGE:
			break;
		}
	}
	
	public void addTask(Task task){
		synchronized (tasks) {
			tasks.add(task);
		}
	}
}
