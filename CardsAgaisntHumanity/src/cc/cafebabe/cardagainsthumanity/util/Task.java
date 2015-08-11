package cc.cafebabe.cardagainsthumanity.util;

import javax.websocket.Session;

import cc.cafebabe.cardagainsthumanity.consts.TaskType;

public class Task {
	private Session session;
	private TaskType taskType;
	private String message;
	public Session getSession() {
		return session;
	}
	public void setSession(Session session) {
		this.session = session;
	}
	public TaskType getTaskType() {
		return taskType;
	}
	public void setTaskType(TaskType taskType) {
		this.taskType = taskType;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public Task(Session session, TaskType taskType, String message) {
		super();
		this.session = session;
		this.taskType = taskType;
		this.message = message;
	}
}
